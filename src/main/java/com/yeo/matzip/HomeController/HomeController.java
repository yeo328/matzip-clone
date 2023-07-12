package com.yeo.matzip.HomeController;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpSession;


@Controller
@RequestMapping(value = "/")
public class HomeController {
    @RequestMapping(value="/",
    method = RequestMethod.GET,
    produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getIndex(){
        ModelAndView modelAndView = new ModelAndView("home/index");
        return modelAndView;
    }


}
