package devos.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.location:/Users/akila/Developer/DeveloperOS/storage/banners}")
    private String bannersPath;

    @Value("${app.storage.avatars:/Users/akila/Developer/DeveloperOS/storage/avatars}")
    private String avatarsPath;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/api/v1/files/banners/**")
                .addResourceLocations("file:" + bannersPath + "/");
        registry.addResourceHandler("/api/v1/files/avatars/**")
                .addResourceLocations("file:" + avatarsPath + "/");
    }
}
