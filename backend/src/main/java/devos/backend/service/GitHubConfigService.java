package devos.backend.service;

import devos.backend.model.GitHubConfig;
import java.util.Optional;
import java.util.UUID;

public interface GitHubConfigService {
    GitHubConfig saveConfig(UUID organizationId, GitHubConfig config);
    Optional<GitHubConfig> getConfigByOrganization(UUID organizationId);
    Optional<GitHubConfig> getConfigByInstallationId(Long installationId);
    void deleteConfig(UUID organizationId);
}
