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
String user="root";
String pwd="ye1397546";
Class.forName("com.mysql.jdbc.Driver");
Connection con=DriverManager.getConnection(connectString,user,pwd);


//获取request中的内容
if(request.getMethod().equalsIgnoreCase("post")){
	String postBody = getPostData(request.getInputStream(),request.getContentLength(),null);
	JSONObject postData = new JSONObject(postBody);
	int code = 0;
	String msg = "success";
	
	try{
		String id = request.getSession().getId();  //当前登录用户id
		String userId = (String)postData.get("userId");
		
		//数据库处理，访问
		Statement stmt = con.createStatement();
		String sql = String.format("select * from Users where ID in (select userFollowedId from Followers where userId = '%s' order by createTime desc)",userId);
		ResultSet rs = stmt.executeQuery(sql);
		
		List<JSONObject> follows = new ArrayList<JSONObject>();
		List<String> ids = new ArrayList<String>();
		int length = 0;
		while(rs.next()){
			length = length + 1;
			JSONObject userInfo = new JSONObject();
			JSONObject temp = new JSONObject();
			String ID = rs.getString("ID");
			String name = rs.getString("name");
			String avatar = rs.getString("avatar");
			String introduction = rs.getString("introduction");
			ids.add(ID);
			
			temp.put("userId",ID);
			temp.put("userName",name);
			temp.put("avatar",avatar);
			temp.put("introduction",introduction);
			
			userInfo.put("user",temp);
			follows.add(userInfo);
		}
		
		for(int i = 0;i < ids.size();i++){
			int currentUserFollowing = 0;
			String ID = ids.get(i);
			String sql2 = String.format("select * from Followers where userId='%s' and userFollowedId='%s'",id,ID);
			ResultSet rs2 = stmt.executeQuery(sql2);
			if(rs2.next() == false) currentUserFollowing = 1;
			JSONObject temp = follows.get(i);
			temp.getJSONObject("user").put("currrentUserFollowing",currentUserFollowing);
			follows.set(i,temp);
		}
		
		JSONObject data = new JSONObject();

		sql = String.format("select * from Users where ID = '%s'",userId);
		rs = stmt.executeQuery(sql);
		if(rs.next() == false){
			code = 1001;
			msg = "User not found";
			data.put("length",0);
		}
		else{
			data.put("length",length);
			data.put("follows",follows);
		}

		JSONObject retval = new JSONObject();
		retval.put("code",code);
		retval.put("msg",msg);
		retval.put("data",data);

		out.print(retval.toString());
	}
	catch(Exception e){
		msg = e.getMessage();
		out.print(msg);
	}
}

%>
