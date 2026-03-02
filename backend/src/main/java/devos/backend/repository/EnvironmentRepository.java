package devos.backend.repository;

import devos.backend.model.Environment;
import devos.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnvironmentRepository extends JpaRepository<Environment, UUID> {
    
    Optional<Environment> findBySlug(String slug);
    
    List<Environment> findByProject(Project project);
    
    boolean existsBySlug(String slug);
}
