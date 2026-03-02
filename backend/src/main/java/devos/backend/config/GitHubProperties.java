package devos.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "spring.github")
@Getter
@Setter
public class GitHubProperties {
    private String appId;
    private String appSlug;
    private String clientId;
    private String clientSecret;
    private String privateKey;
}
