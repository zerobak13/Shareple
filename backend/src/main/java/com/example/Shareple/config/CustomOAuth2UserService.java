// src/main/java/com/example/Shareple/config/CustomOAuth2UserService.java
package com.example.Shareple.config;

import com.example.Shareple.dto.UserResponseDto;
import com.example.Shareple.service.UserService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    public CustomOAuth2UserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String kakaoId = oauth2User.getAttribute("id").toString();
        Map<String, Object> kakaoAccount = oauth2User.getAttribute("kakao_account");

        String email = null;
        String profileImageUrl = null;
        String kakaoNickname = null;

        if (kakaoAccount != null) {
            if (kakaoAccount.containsKey("email")) {
                email = (String) kakaoAccount.get("email");
            }
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile != null) {
                kakaoNickname = (String) profile.get("nickname");
                profileImageUrl = (String) profile.get("profile_image_url");
            }
        }

        userService.processOAuthPostLogin(
                kakaoId,
                kakaoNickname != null ? kakaoNickname : "",
                "",
                profileImageUrl != null ? profileImageUrl : ""
        );

        return oauth2User;
    }
}
