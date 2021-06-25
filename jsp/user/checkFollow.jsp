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
String user="root";
String pwd="ye1397546";
Class.forName("com.mysql.jdbc.Driver");
Connection con=DriverManager.getConnection(connectString,user,pwd);

//-----------------------------------------------------------------以上是每个jsp固定部分

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
		String userIdFollowed = (String)postData.get("userId");
		
		//数据库处理，访问
		Statement stmt = con.createStatement();
		
		//确定用户是否存在
		String sql = String.format("select * from Users where ID='%s'",userIdFollowed);
		ResultSet rs1 = stmt.executeQuery(sql);
		if(rs1.next()==false){
			code = 1001;
			msg = "该用户不存在";
		}
		else{    //用户存在，查找关注表，看登录用户是否关注该用户
			sql = String.format("select * from Followers where userId = '%s'and userFollowedId='%s'",id,userIdFollowed);
			ResultSet rs = stmt.executeQuery(sql);
			int currentUserFollowing = 0;
			if(rs.next()){
				currentUserFollowing = 1;
			}
			data.put("currentUserFollowing",currentUserFollowing);

			rs.close();
		}
		
		rs1.close();
		stmt.close();
		con.close();
	}
	catch(Exception e){
		msg = e.getMessage();
		code = -1;
	}
	//返回结果
	JSONObject retval = new JSONObject();
	retval.put("code",code);
	retval.put("msg",msg);
	retval.put("data",data);
	out.print(retval.toString());
}

%>
