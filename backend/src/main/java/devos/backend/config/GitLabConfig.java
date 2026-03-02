package devos.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for GitLab CI/CD integration (Shadow CI).
 * Values are loaded from application.yaml and can be overridden via environment variables.
 */
@Configuration
@ConfigurationProperties(prefix = "gitlab")
public class GitLabConfig {

    /** GitLab project ID (numeric) */
    private String projectId;

    /** GitLab Pipeline Trigger Token – created under CI/CD > Pipeline triggers */
    private String triggerToken;

    /** GitLab base API URL, defaults to https://gitlab.com */
    private String apiUrl = "https://gitlab.com";

    /** Branch to trigger in GitLab (defaults to test) */
    private String targetBranch = "test";

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getTriggerToken() { return triggerToken; }
    public void setTriggerToken(String triggerToken) { this.triggerToken = triggerToken; }

    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }

    public String getTargetBranch() { return targetBranch; }
    public void setTargetBranch(String targetBranch) { this.targetBranch = targetBranch; }
}
