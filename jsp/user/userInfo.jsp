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
		if(userId == "") userId = id;
		
		//数据库处理，访问
		Statement stmt = con.createStatement();
		String sql = String.format("select * from Users where ID  = '%s'",userId);
		ResultSet rs = stmt.executeQuery(sql);
		JSONObject data = new JSONObject();

		if(rs.next()){     //用户存在
			JSONObject temp = new JSONObject();        //返回用户信息
			String ID = rs.getString("ID");
			String name = rs.getString("name");
			String avatar = rs.getString("avatar");
			String introduction = rs.getString("introduction");
			int createTime = Integer.parseInt(rs.getString("createTime"));
			String bkgImage = rs.getString("bkgImage");
			
			temp.put("userId",ID);
			temp.put("userName",name);
			temp.put("avatar",avatar);
			temp.put("introduction",introduction);
			temp.put("createTime",createTime);
			temp.put("backgroundImage",bkgImage);

			data.put("user",temp);
		}
		else{
			code = 1001;
			msg = "User not found";
		}
		//传回结果
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
