package com.example.Shareple.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@Controller
public class OAuth2Controller {

    @GetMapping("/oauth2/success")
    public String oauthSuccess(@AuthenticationPrincipal OAuth2User oauth2User, Model model) {
        String kakaoId = oauth2User.getAttribute("id").toString();
        Map<String, Object> properties = oauth2User.getAttribute("properties");

        String nickname = properties.get("nickname").toString();

        // TODO: DB에서 해당 kakaoId 존재 여부 확인 (UserService로 대체 예정)
        boolean userExists = false;

        if (!userExists) {
            model.addAttribute("kakaoId", kakaoId);
            model.addAttribute("nickname", nickname);
            return "signup-extra";
        }

        return "redirect:/home";
    }
}
