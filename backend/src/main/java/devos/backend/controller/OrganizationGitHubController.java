package devos.backend.controller;

import devos.backend.dto.GitHubConfigDto;
import devos.backend.model.GitHubConfig;
import devos.backend.service.GitHubConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations/{organizationId}/github-config")
@RequiredArgsConstructor
public class OrganizationGitHubController {

    private final GitHubConfigService gitHubConfigService;

    @PostMapping
    public ResponseEntity<GitHubConfigDto> saveConfig(
            @PathVariable UUID organizationId,
            @RequestBody GitHubConfigDto dto) {
        GitHubConfig config = GitHubConfig.builder()
                .installationId(dto.getInstallationId())
                .active(dto.isActive())
                .build();
        
        GitHubConfig saved = gitHubConfigService.saveConfig(organizationId, config);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @GetMapping
    public ResponseEntity<GitHubConfigDto> getConfig(@PathVariable UUID organizationId) {
        return gitHubConfigService.getConfigByOrganization(organizationId)
                .map(config -> ResponseEntity.ok(mapToDto(config)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteConfig(@PathVariable UUID organizationId) {
        gitHubConfigService.deleteConfig(organizationId);
        return ResponseEntity.noContent().build();
    }

    private GitHubConfigDto mapToDto(GitHubConfig config) {
        return GitHubConfigDto.builder()
                .installationId(config.getInstallationId())
                .organizationId(config.getOrganization().getId())
                .active(config.isActive())
                .build();
    }
}
