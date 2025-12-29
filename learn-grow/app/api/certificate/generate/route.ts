import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const courseName = searchParams.get('courseName') || 'Course';
    
    // Get user info from cookies or headers
    const userName = searchParams.get('userName') || 'Student';
    const completionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate HTML certificate
    const certificateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .certificate {
            background: white;
            width: 100%;
            max-width: 1000px;
            padding: 60px;
            border: 20px solid #f0f0f0;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: 30px;
            left: 30px;
            right: 30px;
            bottom: 30px;
            border: 3px solid #667eea;
            pointer-events: none;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .logo {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 42px;
            color: #333;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        
        .subtitle {
            font-size: 18px;
            color: #666;
            font-style: italic;
        }
        
        .content {
            text-align: center;
            margin: 50px 0;
        }
        
        .awarded-to {
            font-size: 20px;
            color: #666;
            margin-bottom: 20px;
        }
        
        .recipient-name {
            font-size: 48px;
            color: #333;
            font-weight: bold;
            margin: 20px 0;
            padding: 10px 0;
            border-bottom: 3px solid #667eea;
            display: inline-block;
        }
        
        .course-info {
            font-size: 22px;
            color: #555;
            margin: 30px 0;
            line-height: 1.6;
        }
        
        .course-name {
            font-weight: bold;
            color: #667eea;
            font-size: 28px;
            display: block;
            margin: 15px 0;
        }
        
        .completion-date {
            font-size: 18px;
            color: #666;
            margin-top: 30px;
        }
        
        .footer {
            display: flex;
            justify-content: space-around;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #eee;
        }
        
        .signature {
            text-align: center;
        }
        
        .signature-line {
            width: 200px;
            height: 2px;
            background: #333;
            margin: 0 auto 10px;
        }
        
        .signature-title {
            font-size: 14px;
            color: #666;
            font-weight: bold;
        }
        
        .seal {
            position: absolute;
            bottom: 80px;
            right: 80px;
            width: 120px;
            height: 120px;
            border: 5px solid #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: #667eea;
            text-align: center;
            background: white;
            transform: rotate(-15deg);
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s;
        }
        
        .print-button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        }
        
        @media print {
            body {
                background: white;
            }
            
            .print-button {
                display: none;
            }
            
            .certificate {
                box-shadow: none;
                border: none;
                max-width: 100%;
            }
        }
        
        @media (max-width: 768px) {
            .certificate {
                padding: 30px;
            }
            
            .title {
                font-size: 32px;
            }
            
            .recipient-name {
                font-size: 36px;
            }
            
            .course-name {
                font-size: 22px;
            }
            
            .seal {
                width: 80px;
                height: 80px;
                font-size: 10px;
                bottom: 40px;
                right: 40px;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Print Certificate</button>
    
    <div class="certificate">
        <div class="header">
            <div class="logo">🎓 Learn & Grow</div>
            <h1 class="title">CERTIFICATE</h1>
            <p class="subtitle">of Completion</p>
        </div>
        
        <div class="content">
            <p class="awarded-to">This certificate is proudly presented to</p>
            
            <div class="recipient-name">${userName}</div>
            
            <div class="course-info">
                for successfully completing the course
                <span class="course-name">${courseName}</span>
                demonstrating dedication, commitment, and mastery of the subject matter.
            </div>
            
            <p class="completion-date">
                Completed on ${completionDate}
            </p>
        </div>
        
        <div class="footer">
            <div class="signature">
                <div class="signature-line"></div>
                <p class="signature-title">Instructor Signature</p>
            </div>
            
            <div class="signature">
                <div class="signature-line"></div>
                <p class="signature-title">Platform Director</p>
            </div>
        </div>
        
        <div class="seal">
            VERIFIED<br/>COMPLETION
        </div>
    </div>
    
    <script>
        // Auto-print option (commented out by default)
        // window.onload = function() {
        //     setTimeout(function() {
        //         window.print();
        //     }, 500);
        // };
    </script>
</body>
</html>
    `;

    return new NextResponse(certificateHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
