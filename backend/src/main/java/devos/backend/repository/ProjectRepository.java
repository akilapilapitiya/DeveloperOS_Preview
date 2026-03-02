package devos.backend.repository;

import devos.backend.model.Organization;
import devos.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    
    Optional<Project> findBySlug(String slug);
    
    List<Project> findByOrganization(Organization organization);

    List<Project> findByEventId(UUID eventId);
    
    long countByEventIdAndCreatorId(UUID eventId, UUID creatorId);
    
    boolean existsBySlug(String slug);

    List<Project> findByNameContainingIgnoreCaseOrSlugContainingIgnoreCase(String name, String slug);
}
