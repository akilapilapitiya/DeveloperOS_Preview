package devos.backend.repository;

import devos.backend.model.GitHubConfig;
import devos.backend.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GitHubConfigRepository extends JpaRepository<GitHubConfig, UUID> {
    
    Optional<GitHubConfig> findByInstallationId(Long installationId);
    
    Optional<GitHubConfig> findByOrganization(Organization organization);
    
    boolean existsByInstallationId(Long installationId);
}
