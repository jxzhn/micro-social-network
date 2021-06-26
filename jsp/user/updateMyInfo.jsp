<%@ page language="java" contentType="application/json" pageEncoding="utf-8"%>
<%@ page import="java.io.*, java.util.*,java.sql.*"%>
<%@ page import="org.json.simple.*"%>

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
String user="user";
String pwd="123";
Class.forName("com.mysql.jdbc.Driver");
Connection con=DriverManager.getConnection(connectString,user,pwd);


//获取request中的内容
if(request.getMethod().equalsIgnoreCase("post")){
	String postBody = getPostData(request.getInputStream(),request.getContentLength(),"utf-8");
	Object obj = JSONValue.parse(postBody);
	JSONObject postData = (JSONObject) obj;
	int code = 0;
	String msg = "success";
	
	try{
		String id = (String)session.getAttribute("id");                 //当前登录用户id
		String avatar = (String)postData.get("avatar");
		String introduction = (String)postData.get("introduction");
		String bkgImage = (String)postData.get("backgroundImage");
		String userName = (String)postData.get("userName");
		
		//数据库修改，修改User表信息
		Statement stmt = con.createStatement();

		String sql = String.format("select * from Users where ID='%s'",id);
		ResultSet rs1 = stmt.executeQuery(sql);
		if(rs1.next()==false){
			code = 1001;
			msg = "该用户不存在";
		}
		else{
			if(avatar == null) avatar = rs1.getString("avatar");
			if(bkgImage == null) bkgImage = rs1.getString("bkgImage");
			sql = String.format("update Users set name='%s',introduction='%s',bkgImage='%s',avatar='%s' where ID='%s'",userName,introduction,bkgImage,avatar,id);
			int rs = stmt.executeUpdate(sql);
			msg = userName;
		}	
		
		rs1.close();
		stmt.close();
		con.close();
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
