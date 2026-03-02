package devos.backend.service;

import devos.backend.dto.EventDto;
import devos.backend.dto.ProjectDto;
import devos.backend.model.Event;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventService {
    EventDto createEvent(UUID organizationId, EventDto dto);
    Optional<EventDto> getEventById(UUID id);
    List<EventDto> getEventsByOrganization(UUID organizationId);
    EventDto updateEvent(UUID id, EventDto dto);
    void deleteEvent(UUID id);
    List<ProjectDto> getProjectsByEvent(UUID eventId);
}
