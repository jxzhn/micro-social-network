<%@ page language="java" contentType="application/json" pageEncoding="UTF-8"%>
<%@ page import="java.util.*, java.io.*" %>
<%@ page import="org.json.*" %>
<%@ page import="java.sql.*" %>

<%!
String getPostData(InputStream in, int size, String charset) {
    Scanner s = new Scanner(in,charset).useDelimiter("\\A");
    return s.hasNext() ? s.next() : "";
}
%>

<%
String msg = "";
int code = 0;
if (request.getMethod().equalsIgnoreCase("post")) {
    //获得请求体
    String postBody = getPostData(request.getInputStream(), request.getContentLength(), "utf-8");
    //int imgIndex = postbody.indexOf("imageUrl");
    //int contentIndex = postbody.indexOf(":");


	JSONObject postData = new JSONObject(postBody);

    String contents = (String)postData.get("contents");
    String imageUrl = (String)postData.get("imageUrl");
    String currentUserId = (String)session.getAttribute("id");
    String postId = "";
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
            long date = System.currentTimeMillis()/1000L;
            Random r = new Random();
            int rand = r.nextInt(89)+10;
            postId = "p_" + Long.toString(date) + Integer.toString(rand);
            stmt = conn.prepareStatement("insert into Postings (ID,userId,createTime,contents,image) values (?,?,?,?,?)");
            stmt.setString(1,postId);
            stmt.setString(2,currentUserId);
            stmt.setLong(3,date);
            stmt.setString(4,contents);
            stmt.setString(5,imageUrl);

            int cnt = stmt.executeUpdate();
            if (cnt <= 0) {
                code = -1;
                msg = "fail!";
            } else {
                msg = "success";
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
 //   data.put("number",number);
    retval.put("data",data);
    out.print(retval.toString());

}

%>