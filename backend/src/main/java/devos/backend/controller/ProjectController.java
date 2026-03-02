package devos.backend.controller;

import devos.backend.dto.ProjectDto;
import devos.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ProjectController {

    private final ProjectService projectService;
    private final devos.backend.service.FileUploadService fileUploadService;

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@RequestBody ProjectDto dto) {
        log.info("Creating personal project: {}", dto.getName());
        return new ResponseEntity<>(projectService.createProject(null, dto), org.springframework.http.HttpStatus.CREATED);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProjectDto> getProjectBySlug(@PathVariable String slug) {
        return projectService.getProjectBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable java.util.UUID id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<List<devos.backend.dto.ProjectDto>> getMyProjects() {
        return ResponseEntity.ok(projectService.getProjectsForCurrentUser());
    }

    @GetMapping("/search")
    public ResponseEntity<List<devos.backend.dto.ProjectDto>> searchProjects(@RequestParam(defaultValue = "") String query) {
        return ResponseEntity.ok(projectService.searchProjects(query));
    }

    @PostMapping("/{projectId}/avatar")
    @org.springframework.security.access.prepost.PreAuthorize("@security.hasProjectRole(#projectId, 'OWNER', 'CONTRIBUTOR')")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable java.util.UUID projectId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        log.info("Received avatar upload request for project: {}. File size: {}", projectId, file.getSize());
        try {
            String fileName = fileUploadService.storeFile(file);
            log.info("File stored successfully as: {}", fileName);
            ProjectDto updated = projectService.updateAvatar(projectId, fileName);
            log.info("Project updateAvatar service call finished. Returned avatarPath in DTO: {}", updated.getAvatarPath());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Failed to upload avatar: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
