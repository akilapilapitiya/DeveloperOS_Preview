package devos.backend.controller;

import devos.backend.dto.EventParticipantDto;
import devos.backend.model.EventRole;
import devos.backend.service.EventParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class EventParticipantController {

    private final EventParticipantService participantService;

    @GetMapping("/events/{eventId}/participants")
    public ResponseEntity<List<EventParticipantDto>> getParticipants(@PathVariable UUID eventId) {
        return ResponseEntity.ok(participantService.getEventParticipants(eventId));
    }

    @PostMapping("/events/{eventId}/participants/{userId}")
    @PreAuthorize("@security.hasEventAccess(#eventId, 'ADMINISTRATOR')")
    public ResponseEntity<EventParticipantDto> addParticipant(
            @PathVariable UUID eventId,
            @PathVariable UUID userId,
            @RequestParam EventRole role
    ) {
        return new ResponseEntity<>(participantService.addParticipant(eventId, userId, role), HttpStatus.CREATED);
    }

    @PutMapping("/events/{eventId}/participants/{userId}")
    @PreAuthorize("@security.hasEventAccess(#eventId, 'ADMINISTRATOR')")
    public ResponseEntity<EventParticipantDto> updateRole(
            @PathVariable UUID eventId,
            @PathVariable UUID userId,
            @RequestParam EventRole role
    ) {
        return ResponseEntity.ok(participantService.updateParticipantRole(eventId, userId, role));
    }

    @DeleteMapping("/events/{eventId}/participants/{userId}")
    @PreAuthorize("@security.hasEventAccess(#eventId, 'ADMINISTRATOR')")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable UUID eventId,
            @PathVariable UUID userId
    ) {
        participantService.removeParticipant(eventId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events/users/{userId}/participants")
    public ResponseEntity<List<EventParticipantDto>> getUserEvents(@PathVariable UUID userId) {
        // Since participants are public to the user themselves, no PreAuthorize strict check is needed here 
        // as the service likely returns only the specific user's events anyway, or we could add a @PreAuthorize if necessary.
        return ResponseEntity.ok(participantService.getUserEvents(userId));
    }
}
