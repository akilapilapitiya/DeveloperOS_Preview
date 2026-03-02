package devos.backend.service;

import devos.backend.dto.EventParticipantDto;
import devos.backend.model.EventRole;

import java.util.List;
import java.util.UUID;

public interface EventParticipantService {
    EventParticipantDto addParticipant(UUID eventId, UUID userId, EventRole role);
    void removeParticipant(UUID eventId, UUID userId);
    EventParticipantDto updateParticipantRole(UUID eventId, UUID userId, EventRole role);
    List<EventParticipantDto> getEventParticipants(UUID eventId);
    List<EventParticipantDto> getUserEvents(UUID userId);
}
