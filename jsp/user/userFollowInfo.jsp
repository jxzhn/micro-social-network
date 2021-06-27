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
	JSONObject data = new JSONObject();

	try{
		String id = (String)session.getAttribute("id");  //当前登录用户id
		String userId = (String)postData.get("userId");
		
		//数据库处理，访问
		PreparedStatement stmt = con.prepareStatement("select * from Users where ID like ?");
		stmt.setString(1,id);

		ResultSet rs = stmt.executeQuery();
		if (!rs.next()) {
			code = 1001;
			msg = "The user does not exist！";
		} 
		else {
			String sql = "select * from Users where ID = ?";
			stmt = con.prepareStatement(sql);
			stmt.setString(1,userId);
			rs = stmt.executeQuery();
			
			if(rs.next()){    //查找Follwer表
				int following = Integer.parseInt(rs.getString("following"));
				int followed = Integer.parseInt(rs.getString("followed"));
				/*sql = String.format("select * from Followers where userId = '%s'",userId);
				rs = stmt.executeQuery(sql);
				int following = 0;
				while(rs.next()) following += 1;
				sql = String.format("select * from Followers where userFollowedId = '%s'",userId);
				rs = stmt.executeQuery(sql);
				int followed = 0;
				while(rs.next()) followed += 1;*/
				data.put("following",following);
				data.put("followed",followed);
			}
			else{  //找不到该用户
				code = 1001;
				msg = "The user does not exist！";
			}	
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
	retval.put("data",data);
	out.print(retval.toString());
}

%>
