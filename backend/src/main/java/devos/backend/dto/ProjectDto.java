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
public class ProjectDto {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private UUID organizationId;
    private UUID eventId;
    private String eventName;
    private UUID creatorId;
    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private devos.backend.model.Visibility visibility = devos.backend.model.Visibility.PRIVATE;
    
    private String repositoryUrl;
    
    @Builder.Default
    private String defaultBranch = "main";
    
    private String language;
    
    private String avatarPath;
    private String readmeContent;
    private String websiteUrl;
    private java.util.List<String> tags;
    private Long githubRepoId;
    private String githubRepoFullName;
    private Integer stars;
    private Integer forks;
}
