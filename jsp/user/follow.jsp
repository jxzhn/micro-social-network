<%@ page language="java" contentType="application/json" pageEncoding="utf-8"%>
<%@ page import="java.io.*, java.util.*,java.sql.*"%>
<%--@ page import="org.json.*" --%>
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


//获取request中的内容
if(request.getMethod().equalsIgnoreCase("post")){
	String postBody = getPostData(request.getInputStream(),request.getContentLength(),null);
	//JSONObject postData = new JSONObject(postBody);  //得到传入的数据格式
	Object obj = JSONValue.parse(postBody);
	JSONObject postData =  (JSONObject)obj;
	int code = 0;
	String msg = "success";
	
	try{
		
		String id = (String)session.getAttribute("id");  //当前登录用户id
		String userIdFollowed = (String)postData.get("userIdFollowed");
		long createTime = (long)postData.get("createTime");
		
		//String id = "YesTheory1";
		//String userIdFollowed = "YesTheory1";
		//long createTime = 1624519145;
		
		//数据库修改，followers表增加记录
		Statement stmt = con.createStatement();
		
		//用户是否存在
		String sql = String.format("select * from Users where ID='%s'",userIdFollowed);
		ResultSet rs1 = stmt.executeQuery(sql);
		if(rs1.next()==false){
			code = 1001;
			msg = "该用户不存在";
		}
		else{
			//增加关注记录
			sql = String.format("insert into Followers(userId,userFollowedId,createTime) values('%s','%s','%d')",id,userIdFollowed,createTime);
			int rs = stmt.executeUpdate(sql);
			
			if(rs > 0){
				//User表中Following数量加1，被关注用户Followed数量加1
				String sql2 = String.format("update Users set following = following + 1 where ID='%s'",id);
				int rs2 = stmt.executeUpdate(sql2);
				String sql3 = String.format("update Users set followed = followed + 1 where ID='%s'",userIdFollowed);
				int rs3 = stmt.executeUpdate(sql3);
			}
			else{
				code = 1008;
				msg = "关注已存在";
			}
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
