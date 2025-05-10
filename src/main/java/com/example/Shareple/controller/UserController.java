package com.example.Shareple.controller;

import com.example.Shareple.domain.User;
import com.example.Shareple.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public String signup(@RequestParam String kakaoId,
                         @RequestParam String name,
                         @RequestParam String phone) {
        User user = User.builder()
                .kakaoId(kakaoId)
                .name(name)
                .phone(phone)
                .build();
        userService.save(user);
        return "redirect:/home";
    }
    @PostMapping("/signup/complete")
    public String completeSignup(@RequestParam String kakaoId,
                                 @RequestParam String name,
                                 @RequestParam String phone) {
        // DB에 사용자 정보 저장
        // userService.save(new User(...));
        return "redirect:/home";
    }

}
