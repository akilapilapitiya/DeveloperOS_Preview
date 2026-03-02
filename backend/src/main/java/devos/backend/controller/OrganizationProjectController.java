package devos.backend.controller;

import devos.backend.dto.ProjectDto;
import devos.backend.model.Project;
import devos.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/organizations/{organizationId}/projects")
@RequiredArgsConstructor
@Slf4j
public class OrganizationProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("@security.hasOrgRole(#organizationId, 'OWNER', 'ADMIN', 'DEVELOPER')")
    public ResponseEntity<ProjectDto> createProject(@PathVariable UUID organizationId, @RequestBody ProjectDto dto) {
        log.info("Creating project: {} for organization: {}", dto.getName(), organizationId);
        return new ResponseEntity<>(projectService.createProject(organizationId, dto), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("@security.hasOrgAccess(#organizationId)")
    public ResponseEntity<List<ProjectDto>> getProjectsByOrganization(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(projectService.getProjectsByOrganization(organizationId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@security.hasProjectAccess(#id)")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable UUID id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@security.hasProjectRole(#id, 'OWNER', 'CONTRIBUTOR')")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable UUID id,
            @RequestBody ProjectDto dto) {
        return ResponseEntity.ok(projectService.updateProject(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@security.hasProjectRole(#id, 'OWNER')")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

}
