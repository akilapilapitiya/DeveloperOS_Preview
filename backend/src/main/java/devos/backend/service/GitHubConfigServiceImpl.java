package devos.backend.service;

import devos.backend.model.GitHubConfig;
import devos.backend.model.Organization;
import devos.backend.repository.GitHubConfigRepository;
import devos.backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class GitHubConfigServiceImpl implements GitHubConfigService {

    private final GitHubConfigRepository gitHubConfigRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public GitHubConfig saveConfig(UUID organizationId, GitHubConfig config) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        
        return gitHubConfigRepository.findByOrganization(organization)
                .map(existing -> {
                    existing.setInstallationId(config.getInstallationId());
                    existing.setActive(config.isActive());
                    return gitHubConfigRepository.save(existing);
                })
                .orElseGet(() -> {
                    config.setOrganization(organization);
                    return gitHubConfigRepository.save(config);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GitHubConfig> getConfigByOrganization(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        return gitHubConfigRepository.findByOrganization(organization);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GitHubConfig> getConfigByInstallationId(Long installationId) {
        return gitHubConfigRepository.findByInstallationId(installationId);
    }

    @Override
    public void deleteConfig(UUID organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        gitHubConfigRepository.findByOrganization(organization)
                .ifPresent(gitHubConfigRepository::delete);
    }
}
