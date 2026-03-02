package devos.backend.controller;

import devos.backend.dto.EnvironmentDto;
import devos.backend.model.Environment;
import devos.backend.service.EnvironmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/environments")
@RequiredArgsConstructor
public class ProjectEnvironmentController {

    private final EnvironmentService environmentService;

    @PostMapping
    @PreAuthorize("@security.hasProjectAccess(#projectId)")
    public ResponseEntity<EnvironmentDto> createEnvironment(
            @PathVariable UUID projectId,
            @RequestBody EnvironmentDto dto) {
        Environment environment = Environment.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .active(dto.isActive())
                .build();
        
        Environment saved = environmentService.createEnvironment(projectId, environment);
        return new ResponseEntity<>(mapToDto(saved), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("@security.hasProjectAccess(#projectId)")
    public ResponseEntity<List<EnvironmentDto>> getEnvironmentsByProject(@PathVariable UUID projectId) {
        List<EnvironmentDto> dtos = environmentService.getEnvironmentsByProject(projectId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnvironmentDto> getEnvironmentById(@PathVariable UUID id) {
        return environmentService.getEnvironmentById(id)
                .map(environment -> ResponseEntity.ok(mapToDto(environment)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@security.hasProjectAccess(#projectId)")
    public ResponseEntity<EnvironmentDto> updateEnvironment(
            @PathVariable UUID projectId,
            @PathVariable UUID id,
            @RequestBody EnvironmentDto dto) {
        Environment environment = Environment.builder()
                .name(dto.getName())
                .active(dto.isActive())
                .build();
        
        Environment updated = environmentService.updateEnvironment(id, environment);
        return ResponseEntity.ok(mapToDto(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@security.hasProjectAccess(#projectId)")
    public ResponseEntity<Void> deleteEnvironment(@PathVariable UUID projectId, @PathVariable UUID id) {
        environmentService.deleteEnvironment(id);
        return ResponseEntity.noContent().build();
    }

    private EnvironmentDto mapToDto(Environment environment) {
        return EnvironmentDto.builder()
                .id(environment.getId())
                .name(environment.getName())
                .slug(environment.getSlug())
                .projectId(environment.getProject().getId())
                .active(environment.isActive())
                .build();
    }
}
