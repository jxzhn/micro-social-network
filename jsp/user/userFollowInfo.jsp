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
	JSONObject data = new JSONObject();

	try{
		String id = (String)session.getAttribute("id");;  //当前登录用户id
		String userId = (String)postData.get("userId");
		//if(userId == null) userId = id;
		
		//数据库处理，访问
		Statement stmt = con.createStatement();
		String sql = String.format("select * from Users where ID = '%s'",userId);
		ResultSet rs = stmt.executeQuery(sql);
		
		if(rs.next()){    //查找User表
			int following = Integer.parseInt(rs.getString("following"));
			int followed = Integer.parseInt(rs.getString("followed"));
			data.put("following",following);
			data.put("followed",followed);
		}
		else{  //找不到该用户
			code = 1001;
			msg = "User not found";
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
