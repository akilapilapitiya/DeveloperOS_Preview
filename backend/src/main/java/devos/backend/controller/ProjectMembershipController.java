package devos.backend.controller;

import devos.backend.dto.ProjectMembershipDto;
import devos.backend.model.ProjectMembership;
import devos.backend.service.ProjectMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectMembershipController {

    private final ProjectMembershipService membershipService;

    @GetMapping("/{projectId}/members")
    @PreAuthorize("@security.hasProjectRole(#projectId, 'OWNER', 'CONTRIBUTOR')")
    public ResponseEntity<List<ProjectMembershipDto>> getProjectMembers(@PathVariable UUID projectId) {
        return ResponseEntity.ok(membershipService.getProjectMembers(projectId));
    }

    @PostMapping("/{projectId}/members")
    @PreAuthorize("@security.hasProjectRole(#projectId, 'OWNER')")
    public ResponseEntity<ProjectMembershipDto> addProjectMember(
            @PathVariable UUID projectId,
            @RequestBody AddMemberRequest request) {
        return ResponseEntity.ok(membershipService.addProjectMember(projectId, request.email, request.role));
    }

    @PutMapping("/{projectId}/members/{membershipId}/role")
    @PreAuthorize("@security.hasProjectRole(#projectId, 'OWNER')")
    public ResponseEntity<ProjectMembershipDto> updateMemberRole(
            @PathVariable UUID projectId,
            @PathVariable UUID membershipId,
            @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(membershipService.updateProjectMemberRole(projectId, membershipId, request.role));
    }

    @DeleteMapping("/{projectId}/members/{membershipId}")
    @PreAuthorize("@security.hasProjectRole(#projectId, 'OWNER')")
    public ResponseEntity<Void> removeProjectMember(
            @PathVariable UUID projectId,
            @PathVariable UUID membershipId) {
        membershipService.removeProjectMember(projectId, membershipId);
        return ResponseEntity.noContent().build();
    }

    public record AddMemberRequest(String email, ProjectMembership.ProjectRole role) {}
    public record UpdateRoleRequest(ProjectMembership.ProjectRole role) {}
}
