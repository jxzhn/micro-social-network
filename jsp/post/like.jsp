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
    String postbody = getPostData(request.getInputStream(), request.getContentLength(), null);
    JSONObject postData = new JSONObject(postbody);

    String postId = (String)postData.get("postId");
    String currentUserId = (String)session.getAttribute("id");
    int likes = 0;

    //连接数据库
    String connectString = "jdbc:mysql://localhost:3306/wwb?autoReconnect=true" + 
        "&useUnicode=true&characterEncoding=UTF-8";
    //String connectString = "jdbc:mysql://localhost:3306/wwb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";

    try {
        Class.forName("com.mysql.jdbc.Driver");
        //Class.forName("com.mysql.cj.jdbc.Driver");
        Connection conn = DriverManager.getConnection(connectString, "user", "123");
        
        //查询帖子是否存在
        PreparedStatement stmt = conn.prepareStatement("select * from Postings where ID like ?");
        stmt.setString(1, postId);
        
        ResultSet rs = stmt.executeQuery();
        if (!rs.next()) {
            code = 1003;
            msg = "The posting does not exist！";
        } else {
            likes = rs.getInt("likes");

            //查询点赞用户
            stmt = conn.prepareStatement("select * from Users where ID like ?");
            stmt.setString(1,currentUserId);

            rs = stmt.executeQuery();
            if (!rs.next()) {
                code = 1001;
                msg = "The user does not exist！";
            } else {

                //查询当前用户是否点赞该条post
                stmt = conn.prepareStatement("select * from Likes where userId like ? and postId like ?");
                stmt.setString(1, currentUserId);
                stmt.setString(2, postId);

                rs = stmt.executeQuery();
                if(rs.next()) {
                    code = 1008;
                    msg = "like already exist!";
                } else {

                    //更新点赞表
                    long date = System.currentTimeMillis()/1000L;
                    stmt = conn.prepareStatement("insert into likes (userId,postId,createTime) values (?,?,?)");
                    stmt.setString(1,currentUserId);
                    stmt.setString(2,postId);
                    stmt.setLong(3,date);
                    int cnt = stmt.executeUpdate();
                    if (cnt <= 0) {
                        code = -1;
                        msg = "fail";
                    } else {

                        //更新帖子点赞数
                        stmt = conn.prepareStatement("update postings set likes=? where ID=?");
                        stmt.setInt(1,likes+1);
                        stmt.setString(2,postId);
                        cnt = stmt.executeUpdate();
                        msg = "success";
                    }
                }
            }
        }


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
    retval.put("data",data);
    out.print(retval.toString());
}

%>