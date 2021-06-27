<%@ page language="java" contentType="application/json" pageEncoding="UTF-8"%>
<%@ page import="java.util.*, java.io.*" %>
<%@ page import="org.json.*" %>
<%@ page import="java.sql.*" %>

<%!
String getPostData(InputStream in, int size, String charset) {
    if (in != null && size > 0) {
        byte[] buf = new byte[size];
        try{
            in.read(buf);
            if  (charset == null || charset.length() == 0) {
                return new String(buf);
            } else {
                return new String(buf,charset);
            }
        } catch (IOException e){
            e.printStackTrace();
        }
    }
    return null;
}
%>

<%
String msg = "";
int code = 0;
if (request.getMethod().equalsIgnoreCase("post")) {
    //获得请求体
    String postbody = getPostData(request.getInputStream(), request.getContentLength(), "utf-8");
    JSONObject postData = new JSONObject(postbody);

    String postId = (String)postData.get("postId");
    String currentUserId = (String)session.getAttribute("id");
    //String postId = "p_1";
    //String currentUserId = "1";


    //连接数据库
    String connectString = "jdbc:mysql://localhost:3306/wwb?autoReconnect=true" + 
        "&useUnicode=true&characterEncoding=UTF-8";
    //String connectString = "jdbc:mysql://localhost:3306/wwb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    String userName = "";
    String userId = "";
    String userImgUrl = "";
    int date = 0;
    String content = "";
    String imgUrl = "";
    int numComment = 0;
    boolean liked = false;
    int numLike = 0; 

    try {
        Class.forName("com.mysql.jdbc.Driver");
        //Class.forName("com.mysql.cj.jdbc.Driver");
        Connection conn = DriverManager.getConnection(connectString, "user", "123");
        
        //查询帖子是否存在
        PreparedStatement stmt = conn.prepareStatement("select * from Postings where ID like ?");
        stmt.setString(1, postId);
        
        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            userId = rs.getString("userId");
            date = rs.getInt("createTime");
            content = rs.getString("contents");
            imgUrl = rs.getString("image");
            numComment = rs.getInt("comments");
            numLike = rs.getInt("likes");
        } else {
            code = 1003;
            msg = "The posting does not exist！";
        }

        //查询发帖用户
        stmt = conn.prepareStatement("select * from Users where ID like ?");
        stmt.setString(1,userId);

        rs = stmt.executeQuery();
        if (rs.next()) {
            userName = rs.getString("name");
            userImgUrl = rs.getString("avatar");
        } else {
            code = 1001;
            msg = "The user does not exist！";
        }

        //查询当前用户是否点赞该条post
        stmt = conn.prepareStatement("select * from Likes where userId like ? and postId like ?");
        stmt.setString(1, currentUserId);
        stmt.setString(2, postId);

        rs = stmt.executeQuery();
        if(rs.next()) {
            liked = true;
        }
        msg = "success!";
        rs.close();
        stmt.close();
        conn.close();
    } catch (Exception e) {
        code = -1;
        msg = e.getMessage();
    }

    JSONObject retval = new JSONObject();
    retval.put("code",code);
    retval.put("msg",msg);
        JSONObject data = new JSONObject();
            JSONObject user = new JSONObject();
            user.put("userId",userId);
            user.put("userName",userName);
            user.put("userImgUrl",userImgUrl);
        data.put("user",user);
        data.put("date",date);
        data.put("content",content);
        data.put("imgUrl",imgUrl);
        data.put("numComment",numComment);
        data.put("numLike",numLike);
        data.put("liked", liked);
    retval.put("data",data);
    out.print(retval.toString());
}

%>