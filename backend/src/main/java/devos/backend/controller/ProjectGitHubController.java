package devos.backend.controller;

import devos.backend.service.GitHubApiService;
import devos.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/github")
@RequiredArgsConstructor
@Slf4j
public class ProjectGitHubController {

    private final ProjectService projectService;
    private final GitHubApiService gitHubApiService;

    /**
     * Lists available repositories for the project's organization.
     */
    @GetMapping("/available-repositories")
    public ResponseEntity<List<String>> listAvailableRepositories(@PathVariable UUID projectId) {
        // We need to find the org installation ID for this project
        // This logic will be implemented in the service
        return ResponseEntity.ok(projectService.getAvailableGitHubRepositories(projectId));
    }

    /**
     * Syncs project metadata (description, readme, stars, forks) with GitHub.
     */
    @PostMapping("/sync")
    public ResponseEntity<Void> syncMetadata(@PathVariable UUID projectId) {
        projectService.syncGitHubMetadata(projectId);
        return ResponseEntity.ok().build();
    }

    /**
     * Fetches recent commits for the project from GitHub.
     */
    @GetMapping("/commits")
    public ResponseEntity<List<GitHubApiService.CommitDto>> getCommits(@PathVariable UUID projectId) {
        return ResponseEntity.ok(projectService.getProjectCommits(projectId));
    }

    /**
     * Fetches live insights (languages, branches) for the project from GitHub.
     */
    @GetMapping("/insights")
    public ResponseEntity<GitHubApiService.GitHubInsightsDto> getInsights(@PathVariable UUID projectId) {
        return ResponseEntity.ok(projectService.getProjectGitHubInsights(projectId));
    }
}
