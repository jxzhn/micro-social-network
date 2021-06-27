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

    //String contents = "yuyyyyyyyyyyyyyyyyyyyyy";
    //String postId = "p_1";
    //session.setAttribute("id","1");

    String contents = (String)postData.get("content");
    String postId = (String)postData.get("postId");
    String currentUserId = (String)session.getAttribute("id");
    String commentId = "";
    //连接数据库
    String connectString = "jdbc:mysql://localhost:3306/wwb?autoReconnect=true" + 
        "&useUnicode=true&characterEncoding=UTF-8";
    //String connectString = "jdbc:mysql://localhost:3306/wwb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    try {
        Class.forName("com.mysql.jdbc.Driver");
        //Class.forName("com.mysql.cj.jdbc.Driver");
        Connection conn = DriverManager.getConnection(connectString, "user", "123");
        conn.createStatement().execute("SET names 'utf8mb4'");
        PreparedStatement stmt = conn.prepareStatement("select * from Users where ID like ?");
        stmt.setString(1, currentUserId);
        
        //判断用户是否存在
        ResultSet rs = stmt.executeQuery();
        if (!rs.next()) {
            code = 1001;
            msg = "The user does not exist！";
        } else {

            //判断帖子是否存在
            stmt = conn.prepareStatement("select * from Postings where ID like ?");
            stmt.setString(1, postId);
        
            rs = stmt.executeQuery();
            if (!rs.next()) {
                code = 1003;
                msg = "The posting does not exist！";
            } else {
                long date = System.currentTimeMillis()/1000L;
                Random r = new Random();
                int rand = r.nextInt(89)+10;
                commentId = "c_" + Long.toString(date) + Integer.toString(rand);
                stmt = conn.prepareStatement("insert into Comments (ID,userId,postId,contents,createTime) values (?,?,?,?,?)");
                stmt.setString(1,commentId);
                stmt.setString(2,currentUserId);
                stmt.setString(3,postId);
                stmt.setString(4,contents);
                stmt.setLong(5,date);
                
                int cnt = stmt.executeUpdate();
                if (cnt <= 0) {
                    code = -1;
                    msg = "fail!";
                } else {
                    msg = "success";
                    //更新评论数
                    int comment = rs.getInt("comments");
                    stmt = conn.prepareStatement("update Postings set comments=? where ID=?");
                    stmt.setInt(1,comment+1);
                    stmt.setString(2,postId);
                    stmt.executeUpdate();
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