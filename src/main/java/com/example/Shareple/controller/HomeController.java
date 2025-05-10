package com.example.Shareple.controller;

import com.example.Shareple.domain.User;
import com.example.Shareple.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final UserService userService;

    @GetMapping("/home")
    public String home(@AuthenticationPrincipal OAuth2User oauth2User, Model model) {
        String kakaoId = oauth2User.getAttribute("id").toString();
        return userService.findByKakaoId(kakaoId)
                .map(user -> {
                    model.addAttribute("name", user.getName());
                    return "home"; // 사용자 등록된 경우
                })
                .orElseGet(() -> {
                    model.addAttribute("kakaoId", kakaoId);
                    return "signup"; // 등록되지 않은 사용자 → 회원가입
                });
    }
}
