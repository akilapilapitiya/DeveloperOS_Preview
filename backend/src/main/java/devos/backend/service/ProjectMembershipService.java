package devos.backend.service;

import devos.backend.dto.ProjectMembershipDto;
import devos.backend.model.ProjectMembership;

import java.util.List;
import java.util.UUID;

public interface ProjectMembershipService {
    List<ProjectMembershipDto> getProjectMembers(UUID projectId);
    ProjectMembershipDto addProjectMember(UUID projectId, String userEmail, ProjectMembership.ProjectRole role);
    void removeProjectMember(UUID projectId, UUID membershipId);
    ProjectMembershipDto updateProjectMemberRole(UUID projectId, UUID membershipId, ProjectMembership.ProjectRole role);
}
