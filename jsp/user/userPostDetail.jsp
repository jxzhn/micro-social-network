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
		if(userId == null) userId = id;
		int loadedNum = (int)postData.get("loadedNum");
		int requestNum = (int)postData.get("requestNum");
		long timeStamp = (int)postData.get("timeStamp");
		
		//数据库处理，访问
		PreparedStatement stmt = con.prepareStatement("select * from Users where ID like ?");
		stmt.setString(1,id);
		ResultSet rs = stmt.executeQuery();
		if (!rs.next()) {
			code = 1001;
			msg = "The user does not exist！";
		} 
		else {		
			//查找该用户是否存在
			String sql = "select * from Users where ID = ?";
			stmt = con.prepareStatement(sql);
			stmt.setString(1,userId);
			rs = stmt.executeQuery();
			JSONObject userInfo = new JSONObject();
			if(rs.next()){
				String userName = rs.getString("name");      //发布帖子的用户信息
				String userImgUrl = rs.getString("avatar");
				userInfo.put("userName",userName);
				userInfo.put("userId",userId);
				userInfo.put("userImgUrl",userImgUrl);

				//查询用户发布的帖子，且帖子发布时间早于进入页面的时间戳
				sql = "select * from Postings where userId = ? and createTime < ? order by createTime desc";
				stmt = con.prepareStatement(sql);
				stmt.setString(1,userId);
				stmt.setLong(2,timeStamp);
				rs = stmt.executeQuery();
				
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
					sql = "select * from Likes where userId = ? and postId = ?";
					stmt = con.prepareStatement(sql);
					stmt.setString(1,id);
					stmt.setString(2,postIds.get(i));
					rs = stmt.executeQuery();
					int liked = 0;
					if(rs.next()) liked = 1;
					posts.get(i).put("liked",liked);
				}

				data.put("posts",posts);
			}
			else{
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
