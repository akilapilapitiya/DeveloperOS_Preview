package devos.backend.controller;

import devos.backend.service.GitHubApiService;
import devos.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kohsuke.github.GHMyself;
import org.kohsuke.github.GitHub;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/github")
@RequiredArgsConstructor
@Slf4j
public class GitHubIntegrationController {

    private final devos.backend.repository.UserRepository userRepository;
    private final UserService userService;
    private final GitHubApiService gitHubApiService;

    public static class TokenConnectRequest {
        public String token;
    }

    /**
     * Connects GitHub using a Personal Access Token (PAT).
     */
    @PostMapping("/connect")
    public ResponseEntity<Map<String, Object>> connectToken(@RequestBody TokenConnectRequest request) {
        String token = request.token;
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Token is required"));
        }

        try {
            // Validate token by fetching the profile
            GitHub gitHub = gitHubApiService.getGitHubClient(token);
            GHMyself myself = gitHub.getMyself();

            devos.backend.model.User currentUser = userService.getCurrentUser();
            if (currentUser != null) {
                currentUser.setGithubAccessToken(token);
                currentUser.setGithubUsername(myself.getLogin());
                currentUser.setGithubAvatarUrl(myself.getAvatarUrl());
                currentUser.setGithubConnectedAt(java.time.LocalDateTime.now());
                userRepository.save(currentUser);
                log.info("Successfully linked GitHub account and token for user: {}", currentUser.getEmail());
                return ResponseEntity.ok(Map.of("success", true, "message", "GitHub account linked successfully"));
            }

            return ResponseEntity.status(401).body(Map.of("success", false, "error", "User not authenticated"));
        } catch (Exception e) {
            log.error("Failed to connect GitHub PAT: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("success", false, "error", "Invalid GitHub Token or insufficient permissions. Status: " + e.getMessage()));
        }
    }

    @GetMapping("/available-repositories")
    public ResponseEntity<List<String>> listAvailableRepositories() {
        try {
            devos.backend.model.User currentUser = userService.getCurrentUser();
            String token = currentUser.getGithubAccessToken();
            if (token == null) {
                return ResponseEntity.status(401).build();
            }
            List<String> repos = gitHubApiService.listRepositories(token);
            return ResponseEntity.ok(repos);
        } catch (Exception e) {
            log.error("Failed to list repositories: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/repository-metadata")
    public ResponseEntity<GitHubApiService.RepositoryMetadata> getRepositoryMetadata(@RequestParam String fullName) {
        try {
            devos.backend.model.User currentUser = userService.getCurrentUser();
            String token = currentUser.getGithubAccessToken();
            if (token == null) {
                return ResponseEntity.status(401).build();
            }
            GitHubApiService.RepositoryMetadata metadata = gitHubApiService.getRepositoryMetadata(token, fullName);
            return ResponseEntity.ok(metadata);
        } catch (Exception e) {
            log.error("Failed to fetch repository metadata: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/disconnect")
    public ResponseEntity<Map<String, Object>> disconnect() {
        try {
            devos.backend.model.User currentUser = userService.getCurrentUser();
            if (currentUser != null) {
                currentUser.setGithubAccessToken(null);
                currentUser.setGithubUsername(null);
                currentUser.setGithubAvatarUrl(null);
                userRepository.save(currentUser);
                log.info("Disconnected GitHub account for user: {}", currentUser.getEmail());
                return ResponseEntity.ok(Map.of("success", true, "message", "GitHub account disconnected successfully"));
            }
            return ResponseEntity.status(401).body(Map.of("success", false, "error", "User not authenticated"));
        } catch (Exception e) {
            log.error("Failed to disconnect GitHub account: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
