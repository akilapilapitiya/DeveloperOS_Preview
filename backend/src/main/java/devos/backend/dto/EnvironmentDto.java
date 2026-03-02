package devos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentDto {
    private UUID id;
    private String name;
    private String slug;
    private UUID projectId;
    @Builder.Default
    private boolean active = true;
}
