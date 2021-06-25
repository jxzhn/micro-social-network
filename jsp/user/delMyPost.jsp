<%@ page language="java" contentType="application/json" pageEncoding="utf-8"%>
<%@ page import="java.io.*, java.util.*,java.sql.*"%>
<%@ page import="org.json.simple.*" %>

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
	//JSONObject postData = new JSONObject(postBody);
	Object obj = JSONValue.parse(postBody);
	JSONObject postData = (JSONObject) obj;
	int code = 0;
	String msg = "success";
	
	try{
		String id = (String)session.getAttribute("id");;  //当前登录用户id
		String postId = (String)postData.get("userIdFollowed");
		
		//数据库修改，followers表删除记录
		Statement stmt = con.createStatement();

		//查询帖子是否存在
		String sql = String.format("select * from Postings where ID='%s'and userId='%s'",postId,id);
		ResultSet rs1 = stmt.executeQuery(sql);
		if(rs1.next() == false){
			code = 1003;
			msg = "该贴不存在";
		}
		else{
			sql = String.format("delete from Postings where ID='%s'and userId='%s'",postId,id);
			int rs = stmt.executeUpdate(sql);
		}

		
	}
	catch(Exception e){
		msg = e.getMessage();
		code = -1;
	}
	JSONObject retval = new JSONObject();
	retval.put("code",code);
	retval.put("msg",msg);
	JSONObject data = new JSONObject();
	retval.put("data",data);
	out.print(retval.toString());
}

%>
