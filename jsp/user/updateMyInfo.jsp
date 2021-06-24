<%@ page language="java" contentType="application/json" pageEncoding="utf-8"%>
<%@ page import="java.io.*, java.util.*,java.sql.*"%>
<%@ page import="org.json.*" %>

<%!

String getPostData(InputStream in,int size,String charset){
	if(in != null && size > 0){
		byte[] buf = new byte[size];
		try{
			in.read(buf);
			if(charset == null || charset.length() == 0)
				return new String(buf);
			else
				return new String(buf,charset);
		}
		catch(IOException e){
			e.printStackTrace();
		}
	}
	return null;
}

%>

<%

request.setCharacterEncoding("utf-8");

//访问数据库
String connectString="jdbc:mysql://localhost:3306/wwb"
		+"?autoReconnect=true&useUnicode=true"+"&characterEncoding=UTF-8";
String user="root";
String pwd="ye1397546";
Class.forName("com.mysql.jdbc.Driver");
Connection con=DriverManager.getConnection(connectString,user,pwd);


//获取request中的内容
if(request.getMethod().equalsIgnoreCase("post")){
	String postBody = getPostData(request.getInputStream(),request.getContentLength(),null);
	JSONObject postData = new JSONObject(postBody);
	
	try{
		String id = request.getSession().getId();                 //当前登录用户id
		String avatar = (String)postData.get("avatar");
		String introduction = (String)postData.get("introduction");;
		String bkgImage = (String)postData.get("backgroundImage");;
		
		//数据库修改，修改User表信息
		Statement stmt = con.createStatement();
		String sql = String.format("update Users set avatar='%s',introduction='%s',bkgImage='%s' where ID='%s'",avatar,introduction,bkgImage,id);
		int rs = stmt.executeUpdate(sql);
		
		if(rs > 0){
			JSONObject retval = new JSONObject();
			retval.put("code",0);
			retval.put("msg","success");
			JSONObject data = new JSONObject();
			retval.put("data",data);
			out.print(retval.toString());
		}
	}
	catch(Exception e){
		String msg = e.getMessage();
		out.print(msg);
	}
}

%>
