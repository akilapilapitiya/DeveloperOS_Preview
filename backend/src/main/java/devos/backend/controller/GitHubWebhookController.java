package devos.backend.controller;

import devos.backend.service.GitLabTriggerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;

/**
 * Handles incoming GitHub Webhook events.
 *
 * Flow:
 *   GitHub push to "test" branch
 *     --> GitHub fires POST /api/v1/webhooks/github
 *       --> This controller verifies the HMAC-SHA256 signature
 *         --> Calls GitLabTriggerService to launch the GitLab pipeline
 *
 * This is the "Shadow CI" feature – GitHub pushes automatically trigger
 * CI/CD pipelines in GitLab, with your own backend as the secure bridge.
 */
@RestController
@RequestMapping("/api/v1/webhooks")
public class GitHubWebhookController {

    private static final Logger log = LoggerFactory.getLogger(GitHubWebhookController.class);
    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
    private static final String TARGET_BRANCH = "refs/heads/test";

    @Value("${github.webhook-secret:}")
    private String webhookSecret;

    private final GitLabTriggerService gitLabTriggerService;

    public GitHubWebhookController(GitLabTriggerService gitLabTriggerService) {
        this.gitLabTriggerService = gitLabTriggerService;
    }

    /**
     * Receives GitHub push webhook events and triggers the GitLab pipeline.
     *
     * @param signature The X-Hub-Signature-256 header from GitHub
     * @param event     The X-GitHub-Event header (we only process "push" events)
     * @param payload   The raw request body as a string for HMAC verification
     */
    @PostMapping("/github")
    public ResponseEntity<Map<String, String>> handleGitHubWebhook(
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature,
            @RequestHeader(value = "X-GitHub-Event", defaultValue = "unknown") String event,
            @RequestBody String payload) {

        log.info("Received GitHub webhook event: {}", event);

        // 1. Verify HMAC signature if a webhook secret is configured
        if (!webhookSecret.isBlank()) {
            if (signature == null) {
                log.warn("Missing X-Hub-Signature-256 header. Rejecting webhook.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Missing signature"));
            }
            if (!isSignatureValid(payload, signature)) {
                log.warn("Invalid X-Hub-Signature-256. Rejecting webhook.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid signature"));
            }
        } else {
            log.warn("No webhook secret configured – signature verification is DISABLED. Set github.webhook-secret for security.");
        }

        // 2. Only process "push" events
        if (!"push".equals(event)) {
            log.info("Ignoring non-push event: {}", event);
            return ResponseEntity.ok(Map.of("status", "ignored", "reason", "non-push event"));
        }

        // 3. Parse the push ref and commit info from the JSON payload (simple string-based parsing)
        String ref = extractJsonField(payload, "ref");
        String commitSha = extractNestedField(payload, "head_commit", "id");
        String pusher = extractNestedField(payload, "pusher", "name");

        log.info("Push event: ref={}, sha={}, pusher={}", ref, commitSha, pusher);

        // 4. Only trigger if push is to the "test" branch
        if (!TARGET_BRANCH.equals(ref)) {
            log.info("Push is to branch '{}', not target '{}'. Ignoring.", ref, TARGET_BRANCH);
            return ResponseEntity.ok(Map.of("status", "ignored", "reason", "not the test branch"));
        }

        // 5. Trigger the GitLab pipeline
        log.info("Shadow CI triggered – firing GitLab pipeline for push by {}", pusher);
        boolean triggered = gitLabTriggerService.triggerPipeline(ref, commitSha, pusher);

        if (triggered) {
            return ResponseEntity.ok(Map.of(
                    "status", "triggered",
                    "message", "GitLab pipeline triggered successfully",
                    "ref", ref,
                    "sha", commitSha != null ? commitSha : "unknown"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to trigger GitLab pipeline"));
        }
    }

    /**
     * Verifies the GitHub HMAC-SHA256 signature.
     * GitHub sends: X-Hub-Signature-256: sha256=<hex-digest>
     */
    private boolean isSignatureValid(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(
                    webhookSecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256_ALGORITHM);
            mac.init(keySpec);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = "sha256=" + HexFormat.of().formatHex(hash);
            
            if (!expectedSignature.equals(signature)) {
                log.warn("HMAC mismatch. Expected: {} | Received: {}", expectedSignature, signature);
                return false;
            }
            return true;
        } catch (Exception e) {
            log.error("Failed to compute HMAC signature: {}", e.getMessage());
            return false;
        }
    }

    /** Simple JSON field extractor (avoids pulling in Jackson for raw string parsing) */
    private String extractJsonField(String json, String field) {
        String search = "\"" + field + "\"";
        int idx = json.indexOf(search);
        if (idx < 0) return null;
        int colon = json.indexOf(':', idx + search.length());
        if (colon < 0) return null;
        int start = json.indexOf('"', colon + 1);
        if (start < 0) return null;
        int end = json.indexOf('"', start + 1);
        if (end < 0) return null;
        return json.substring(start + 1, end);
    }

    /** Extracts a field from a nested JSON object */
    private String extractNestedField(String json, String parent, String field) {
        String parentKey = "\"" + parent + "\"";
        int parentIdx = json.indexOf(parentKey);
        if (parentIdx < 0) return null;
        int braceStart = json.indexOf('{', parentIdx);
        if (braceStart < 0) return null;
        int braceEnd = json.indexOf('}', braceStart);
        if (braceEnd < 0) return null;
        String nested = json.substring(braceStart, braceEnd + 1);
        return extractJsonField(nested, field);
    }
}
