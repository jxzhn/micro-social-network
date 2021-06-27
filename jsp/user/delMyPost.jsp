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
	String postBody = getPostData(request.getInputStream(),request.getContentLength(),"utf-8");
	JSONObject postData = new JSONObject(postBody);
	//Object obj = JSONValue.parse(postBody);
	//JSONObject postData = (JSONObject) obj;
	int code = 0;
	String msg = "success";
	
	try{
		String id = (String)session.getAttribute("id");  //当前登录用户id
		String postId = (String)postData.get("postId");

		PreparedStatement stmt = con.prepareStatement("select * from Users where ID like ?");
        stmt.setString(1, id);
        
        //判断用户是否存在
        ResultSet rs = stmt.executeQuery();
        if (!rs.next()) {
            code = 1001;
            msg = "The user does not exist！";
        } else {
			
			//数据库修改，followers表删除记录

			//查询帖子是否存在
			String sql = "select * from Postings where ID=? and userId=?";
			stmt = con.prepareStatement(sql);
			stmt.setString(1,postId);
			stmt.setString(2,id);

			ResultSet rs1 = stmt.executeQuery();
			if(rs1.next() == false){
				code = 1003;
				msg = "该贴不存在";
			}
			else{
				//要先把对应Likes和comments表里的记录删掉
				sql = "delete from Likes where postId=?";
				stmt = con.prepareStatement(sql);
				stmt.setString(1,postId);
				stmt.executeUpdate();


				sql = "delete from Comments where postId=?";
				stmt = con.prepareStatement(sql);
				stmt.setString(1,postId);
				stmt.executeUpdate();


				//删除帖子
				sql = "delete from Postings where ID=? and userId=?";
				stmt = con.prepareStatement(sql);
				stmt.setString(1,postId);
				stmt.setString(2,id);
				stmt.executeUpdate();
			}
			rs1.close();
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
