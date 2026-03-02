package devos.backend.repository;

import devos.backend.model.Project;
import devos.backend.model.ProjectMembership;
import devos.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectMembershipRepository extends JpaRepository<ProjectMembership, UUID> {
    List<ProjectMembership> findByProject(Project project);
    List<ProjectMembership> findByProjectId(UUID projectId);
    List<ProjectMembership> findByUser(User user);
    Optional<ProjectMembership> findByUserAndProject(User user, Project project);
    boolean existsByUserAndProjectAndRoleIn(User user, Project project, List<ProjectMembership.ProjectRole> roles);
}
