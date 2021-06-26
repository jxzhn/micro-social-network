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
String connectString="jdbc:mysql://127.0.0.1:3306/wwb"
		+"?autoReconnect=true&useUnicode=true"+"&characterEncoding=UTF-8";
String user="user";
String pwd="123";
Class.forName("com.mysql.jdbc.Driver");
Connection con=DriverManager.getConnection(connectString,user,pwd);

int code = 0;
	String msg = "success";
	
	try{
		String id = "111111";                 //当前登录用户id
		String avatar = "";
		String introduction = "like";
		String bkgImage = "http://localhost:8080";
		
		//数据库修改，修改User表信息
		Statement stmt = con.createStatement();

		String sql = String.format("select * from Users where ID='%s'",id);
		ResultSet rs1 = stmt.executeQuery(sql);
		if(rs1.next()==false){
			code = 1001;
			msg = "该用户不存在";
		}
		else{
			sql = String.format("update Users set avatar='%s',introduction='%s',bkgImage='%s' where ID='%s'",avatar,introduction,bkgImage,id);
			int rs = stmt.executeUpdate(sql);
			
			if(rs > 0){
				JSONObject retval = new JSONObject();
				retval.put("code",code);
				retval.put("msg",msg);
				JSONObject data = new JSONObject();
				retval.put("data",data);
				out.print(retval.toString());
			}
		}		
	}
	catch(Exception e){
		msg = e.getMessage();
		out.print(msg);
	}

%>
