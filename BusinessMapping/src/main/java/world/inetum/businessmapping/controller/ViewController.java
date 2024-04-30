package world.inetum.businessmapping.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ViewController {

    // This method catches all non-static and non-API requests
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        // Forwarding to the root path ("/") where index.html is served
        return "forward:/";
    }
}
