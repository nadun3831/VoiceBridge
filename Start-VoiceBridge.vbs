Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "c:\BscIT\Projects\VoiceBridge\Start-VoiceBridge.bat" & chr(34), 0
Set WshShell = Nothing
