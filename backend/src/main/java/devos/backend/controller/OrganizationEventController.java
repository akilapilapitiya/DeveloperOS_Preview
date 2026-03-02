package devos.backend.controller;

import devos.backend.dto.EventDto;
import devos.backend.dto.ProjectDto;
import devos.backend.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class OrganizationEventController {

    private final EventService eventService;

    @GetMapping("/organizations/{orgId}/events")
    public ResponseEntity<List<EventDto>> getOrganizationEvents(@PathVariable UUID orgId) {
        return ResponseEntity.ok(eventService.getEventsByOrganization(orgId));
    }

    @PostMapping("/organizations/{orgId}/events")
    @PreAuthorize("@security.hasOrgRole(#orgId, 'OWNER', 'DEVELOPER')")
    public ResponseEntity<EventDto> createEvent(@PathVariable UUID orgId, @RequestBody EventDto dto) {
        log.info("Creating event: {} for organization: {}", dto.getName(), orgId);
        return new ResponseEntity<>(eventService.createEvent(orgId, dto), HttpStatus.CREATED);
    }

    @PutMapping("/events/{id}")
    @PreAuthorize("@security.hasEventAccess(#id, 'OWNER', 'DEVELOPER')")
    public ResponseEntity<EventDto> updateEvent(@PathVariable UUID id, @RequestBody EventDto dto) {
        return ResponseEntity.ok(eventService.updateEvent(id, dto));
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("@security.hasEventAccess(#id, 'OWNER')")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events/{id}")
    @PreAuthorize("@security.hasEventAccess(#id, 'OWNER', 'DEVELOPER', 'ADMINISTRATOR', 'PARTICIPANT')")
    public ResponseEntity<EventDto> getEvent(@PathVariable UUID id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/events/{id}/projects")
    public ResponseEntity<List<ProjectDto>> getEventProjects(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.getProjectsByEvent(id));
    }
}
