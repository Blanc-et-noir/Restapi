package com.spring.restapi.controller;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartRequest;

import com.spring.restapi.service.ArticleService;
import com.spring.restapi.util.CookieUtil;
import com.spring.restapi.util.JwtUtil;

@Controller("articleController")
public class ArticleController {
	@Autowired
	private ArticleService articleService;
	
	@RequestMapping(value={"/articles"},method={RequestMethod.POST})
	public ResponseEntity<HashMap> addArticle(MultipartRequest mRequest, HttpServletRequest request){
		return null;
	}
	
	@RequestMapping(value={"/articles"},method={RequestMethod.GET})
	public ResponseEntity<HashMap> getArticles(@RequestParam HashMap<String,String> param, HttpServletRequest request){
		HashMap result = new HashMap();
		try {
			int section = Integer.parseInt(param.get("section"));
			int page = Integer.parseInt(param.get("page"));
			
			if(!param.containsKey("search_flag")) {
				param.put("search_flag", "user_id");
			}else if(!param.get("search_flag").equals("user_id")&&!param.get("search_flag").equals("article_title")&&!param.get("search_flag").equals("article_content")){
				param.put("search_flag", "user_id");
			}
			
			if(!param.containsKey("search_content")) {
				param.put("search_content", "");
			}
			
			param.put("offset", ((section-1)*25+(page-1)*5)+"");
			
			result = articleService.getArticles(param);
			result.put("flag", true);
			result.put("content", "게시글 목록 조회 성공");
			return new ResponseEntity<HashMap>(result,HttpStatus.OK);
		}catch(Exception e) {
			e.printStackTrace();
			result.put("flag", false);
			result.put("content", "게시글 목록 조회 실패");
			return new ResponseEntity<HashMap>(result,HttpStatus.BAD_REQUEST);
		}
	}
	
	@RequestMapping(value={"/articles/{article_id}"},method={RequestMethod.DELETE})
	public ResponseEntity<HashMap> deleteArticle(MultipartRequest mRequest, HttpServletRequest request){
		return null;
	}
	
	@RequestMapping(value={"/articles/{article_id}"},method={RequestMethod.PUT})
	public ResponseEntity<HashMap> updateArticle(MultipartRequest mRequest, HttpServletRequest request){
		return null;
	}
	
	@RequestMapping(value={"/articles/{article_id}"},method={RequestMethod.GET})
	public ResponseEntity<HashMap> getArticle(@PathVariable String article_id,HashMap param, HttpServletRequest request){
		HashMap result = new HashMap();
		try {
			String user_accesstoken = CookieUtil.getAccesstoken(request);
			
			if(JwtUtil.validateToken(user_accesstoken)) {
				param.put("user_id", JwtUtil.getData(user_accesstoken, "user_id"));
			}else {
				param.put("user_id", "");
			}
			
			param.put("article_id", article_id);
			
			result = articleService.getArticle(param);
			result.put("flag", true);
			result.put("content", "게시글 조회 성공");
			return new ResponseEntity<HashMap>(result,HttpStatus.OK);
		}catch(Exception e) {
			e.printStackTrace();
			result.put("flag", false);
			result.put("content", "게시글 목록 실패");
			return new ResponseEntity<HashMap>(result,HttpStatus.BAD_REQUEST);
		}
	}
}