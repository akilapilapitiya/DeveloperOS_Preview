package devos.backend.service;

import devos.backend.config.GitLabConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

/**
 * Service responsible for triggering GitLab CI/CD pipelines via the GitLab Trigger API.
 * This is the core of the "Shadow CI" feature – when GitHub receives a push,
 * this service fires a pipeline in GitLab automatically.
 */
@Service
public class GitLabTriggerService {

    private static final Logger log = LoggerFactory.getLogger(GitLabTriggerService.class);

    private final GitLabConfig gitLabConfig;
    private final RestTemplate restTemplate;

    public GitLabTriggerService(GitLabConfig gitLabConfig) {
        this.gitLabConfig = gitLabConfig;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Triggers a pipeline in the configured GitLab project.
     *
     * @param ref The branch or tag to trigger the pipeline on (e.g., "test")
     * @param commitSha The GitHub commit SHA (passed as a pipeline variable for traceability)
     * @param pusher The GitHub user who triggered the push
     * @return true if the trigger was successful, false otherwise
     */
    public boolean triggerPipeline(String ref, String commitSha, String pusher) {
        if (gitLabConfig.getProjectId() == null || gitLabConfig.getTriggerToken() == null) {
            log.error("GitLab Shadow CI is not configured. Set gitlab.project-id and gitlab.trigger-token.");
            return false;
        }

        String url = String.format(
            "%s/api/v4/projects/%s/trigger/pipeline",
            gitLabConfig.getApiUrl(),
            gitLabConfig.getProjectId()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("token", gitLabConfig.getTriggerToken());
        body.add("ref", gitLabConfig.getTargetBranch());
        
        // Note: We removed the variables[...] parameters because using a standard Pipeline Trigger Token 
        // without Maintainer privileges often results in: "Insufficient permissions to set pipeline variables" (400)
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("GitLab pipeline triggered successfully by push from {} on ref {}", pusher, ref);
                return true;
            } else {
                log.error("GitLab trigger returned non-2xx status: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to trigger GitLab pipeline: {}", e.getMessage());
            return false;
        }
    }
}
