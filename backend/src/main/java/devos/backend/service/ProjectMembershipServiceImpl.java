package devos.backend.service;

import devos.backend.dto.ProjectMembershipDto;
import devos.backend.model.Project;
import devos.backend.model.ProjectMembership;
import devos.backend.model.User;
import devos.backend.repository.ProjectMembershipRepository;
import devos.backend.repository.ProjectRepository;
import devos.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectMembershipServiceImpl implements ProjectMembershipService {

    private final ProjectMembershipRepository membershipRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectMembershipDto> getProjectMembers(UUID projectId) {
        return membershipRepository.findByProjectId(projectId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectMembershipDto addProjectMember(UUID projectId, String userEmail, ProjectMembership.ProjectRole role) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        if (membershipRepository.findByUserAndProject(user, project).isPresent()) {
            throw new RuntimeException("User is already a member of this project");
        }

        ProjectMembership membership = ProjectMembership.builder()
                .project(project)
                .user(user)
                .role(role)
                .build();

        return mapToDto(membershipRepository.save(membership));
    }

    @Override
    public void removeProjectMember(UUID projectId, UUID membershipId) {
        ProjectMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
        
        if (!membership.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Membership does not belong to this project");
        }

        membershipRepository.delete(membership);
    }

    @Override
    public ProjectMembershipDto updateProjectMemberRole(UUID projectId, UUID membershipId, ProjectMembership.ProjectRole role) {
        ProjectMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        if (!membership.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Membership does not belong to this project");
        }

        membership.setRole(role);
        return mapToDto(membershipRepository.save(membership));
    }

    private ProjectMembershipDto mapToDto(ProjectMembership membership) {
        return ProjectMembershipDto.builder()
                .id(membership.getId())
                .userId(membership.getUser().getId())
                .userEmail(membership.getUser().getEmail())
                .userFullName(membership.getUser().getFirstName() + " " + membership.getUser().getLastName())
                .projectId(membership.getProject().getId())
                .role(membership.getRole())
                .createdAt(membership.getCreatedAt())
                .build();
    }
}
