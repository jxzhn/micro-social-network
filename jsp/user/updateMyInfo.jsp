<%@ page language="java" contentType="application/json" pageEncoding="utf-8"%>
<%@ page import="java.io.*, java.util.*,java.sql.*"%>
<%@ page import="org.json.*"%>

<%!
String getPostData(InputStream in, int size, String charset) {
    Scanner s = new Scanner(in,charset).useDelimiter("\\A");
    return s.hasNext() ? s.next() : "";
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
con.createStatement().execute("SET names 'utf8mb4'");

//获取request中的内容
if(request.getMethod().equalsIgnoreCase("post")){
	String postBody = getPostData(request.getInputStream(),request.getContentLength(),"utf-8");
	JSONObject postData = new JSONObject(postBody);
	int code = 0;
	String msg = "success";
	
	try{
		String id = (String)session.getAttribute("id");                 //当前登录用户id
		String avatar = (String)postData.get("avatar");
		String introduction = (String)postData.get("introduction");
		String bkgImage = (String)postData.get("backgroundImage");
		String userName = (String)postData.get("userName");
		
		//数据库修改，修改User表信息
		PreparedStatement stmt = con.prepareStatement("select * from Users where ID like ?");
		stmt.setString(1,id);
		ResultSet rs = stmt.executeQuery();
		if (!rs.next()) {
			code = 1001;
			msg = "The user does not exist！";
		} 
		else {
			if(avatar == null) avatar = rs.getString("avatar");
			if(bkgImage == null) bkgImage = rs.getString("bkgImage");
			String sql = "update Users set name=?,introduction=?,bkgImage=?,avatar=? where ID=?";
			stmt = con.prepareStatement(sql);
			stmt.setString(1,userName);
			stmt.setString(2,introduction);
			stmt.setString(3,bkgImage);
			stmt.setString(4,avatar);
			stmt.setString(5,id);
			int rs1 = stmt.executeUpdate();
			//msg = userName;
		}
		rs.close();
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
