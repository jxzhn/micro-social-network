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


//获取request中的内容
if(request.getMethod().equalsIgnoreCase("post")){
	String postBody = getPostData(request.getInputStream(),request.getContentLength(),null);
	JSONObject postData = new JSONObject(postBody);  //得到传入的数据格式
	int code = 0;
	String msg = "success";
	
	try{
		
		String id = (String)session.getAttribute("id");  //当前登录用户id
		String userIdFollowed = (String)postData.get("userIdFollowed");
		long createTime = System.currentTimeMillis()/1000L;
		
		//String id = "YesTheory1";
		//String userIdFollowed = "YesTheory1";
		//long createTime = 1624519145;
		
		//数据库修改，followers表增加记录
		PreparedStatement stmt = con.prepareStatement("select * from Users where ID like ?");
		stmt.setString(1,id);

		ResultSet rs = stmt.executeQuery();
		if (!rs.next()) {
			code = 1001;
			msg = "The user does not exist！";
		} 
		else {
			//用户是否存在
			String sql = "select * from Users where ID=?";
			stmt = con.prepareStatement(sql);
			stmt.setString(1,userIdFollowed);
			rs = stmt.executeQuery();
			if(!rs.next()){
				code = 1001;
				msg = "The user does not exist！";
			}
			else{
				//增加关注记录
				sql = "insert into Followers(userId,userFollowedId,createTime) values(?,?,?)";
				stmt = con.prepareStatement(sql);
				stmt.setString(1,id);
				stmt.setString(2,userIdFollowed);
				stmt.setLong(3,createTime);
				int rs1 = stmt.executeUpdate();
				
				if(rs1 > 0){
					//User表中Following数量加1，被关注用户Followed数量加1
					sql = "update Users set following = following + 1 where ID=?";
					stmt = con.prepareStatement(sql);
					stmt.setString(1,id);
					rs1 = stmt.executeUpdate();
					sql = "update Users set followed = followed + 1 where ID=?";
					stmt = con.prepareStatement(sql);
					stmt.setString(1,userIdFollowed);
					rs1 = stmt.executeUpdate();
				}
				else{
					code = 1008;
					msg = "关注已存在";
				}
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
	JSONObject data = new JSONObject();
	retval.put("data",data);
	out.print(retval.toString());
}

%>
