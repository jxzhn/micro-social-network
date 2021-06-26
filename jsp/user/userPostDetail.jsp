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
	JSONObject postData = new JSONObject(postBody);
	int code = 0;
	String msg = "success";
	JSONObject data = new JSONObject();

	try{
		String id = (String)session.getAttribute("id");;  //当前登录用户id
		String userId = (String)postData.get("userId");
		if(userId == null) userId = id;
		int loadedNum = (int)postData.get("loadedNum");
		int requestNum = (int)postData.get("requestNum");
		long timeStamp = (int)postData.get("timeStamp");
		
		//数据库处理，访问
		Statement stmt = con.createStatement();
		
		//查找该用户是否存在
		String sql1 = String.format("select * from Users where ID = '%s'",userId);
		ResultSet rs1 = stmt.executeQuery(sql1);
		JSONObject userInfo = new JSONObject();
		if(rs1.next()){
			String userName = rs1.getString("name");      //发布帖子的用户信息
			String userID = userId;
			String userImgUrl = rs1.getString("avatar");
			userInfo.put("userName",userName);
			userInfo.put("userID",userID);
			userInfo.put("userImgUrl",userImgUrl);

			//查询用户发布的帖子，且帖子发布时间早于进入页面的时间戳
			String sql = String.format("select * from Postings where userId = '%s'and createTime < '%d' order by createTime desc",userId,timeStamp);
			ResultSet rs = stmt.executeQuery(sql);
			
			List<JSONObject> posts = new ArrayList<>();
			List<String> postIds = new ArrayList<>();
			int length = 0;
			while(rs.next()){
				length = length + 1;
				
				if(length > loadedNum && length <= loadedNum+requestNum){    //获得帖子信息
					JSONObject temp = new JSONObject();
					String postId = rs.getString("ID");
					long date = Integer.parseInt(rs.getString("createTime"));
					String content = rs.getString("contents");
					int numLike = Integer.parseInt(rs.getString("likes"));
					int numComment = Integer.parseInt(rs.getString("comments"));
					String imgUrl = rs.getString("image");
					
					postIds.add(postId);
					
					temp.put("user",userInfo);
					temp.put("postId",postId);
					temp.put("date",date);
					temp.put("content",content);
					temp.put("imgUrl",imgUrl);
					temp.put("numComment",numComment);
					temp.put("numLike",numLike);
					posts.add(temp);
				}
			}
			
			//记录登录用户是否给该帖子点赞
			for(int i = 0;i < postIds.size();i++){
				sql = String.format("select * from Likes where userId = '%s'and postId = '%s'",id,postIds.get(i));
				rs = stmt.executeQuery(sql);
				int liked = 0;
				if(rs.next()) liked = 1;
				posts.get(i).put("liked",liked);
			}

			data.put("posts",posts);
			rs.close();
		}
		else{
			code = 1001;
			msg = "该用户不存在";
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
	retval.put("data",data);
		
	out.print(retval.toString());
}

%>
