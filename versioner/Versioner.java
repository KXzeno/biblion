package versioner;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Personal command-line based version updater
 * for Node projects
 */
public class Versioner {
  public Evolution type;
  private String ver = null;

  /**
   * Constructor for dev use
   */
  public Versioner(Evolution type) {
    this.type = type;
  }

  /**
   * @param type the evolution stage for upgrade or
   * the full version itself for replacement
   */
  public Versioner(String type) {
    this.setVer(type);
    if (this.ver != null) {
      return;
    }

    for (Evolution evoMem : Evolution.values()) {
      String parsedType = type.toUpperCase();
      if (parsedType.equals(evoMem.evolutionType())) {
        this.type = evoMem;
        return;
      }
    }
    this.type = parseSynonym(type);
  }

  /**
   * Maps synonyms to evolution stages
   *
   * @param type a synonymous evolution stage
   */
  private Evolution parseSynonym(String type) {
    switch (type.toUpperCase()) {
      case "PATCH": return Evolution.Micro;
      case "MINOR": return Evolution.Proxy;
      case "MAJOR": return Evolution.Macro;
      default: throw new Error("Invalid type argument");
    }
  }

  /**
   * Versioner executor; runs the changes to `package.json`
   */
  private void execute() throws FileNotFoundException, IOException {
    File pkgJson = new File("package.json");

    BufferedReader pkgJsonReader = new BufferedReader(new FileReader(pkgJson));

    String currLine = pkgJsonReader.readLine();
    StringBuilder toWrite = new StringBuilder();

    while (currLine != null) {
      if (currLine.contains("\"version\":")) {
        if (this.ver != null) {
          currLine = currLine.replaceAll("[\\d]+\\.[\\d]+\\.[\\d]+", this.ver);
          System.out.printf("%s: %s", "Updated -> ", this.ver);
        } else {
          String newVer = this.updateVersion(currLine);
          System.out.printf("%s: %s", "Updated -> ", newVer);
          currLine = currLine.replaceAll("[\\d]+\\.[\\d]+\\.[\\d]+", newVer);
        }
      }

      toWrite.append(currLine);
      currLine = pkgJsonReader.readLine();

      if (currLine != null) {
        toWrite.append('\n');
      }
    }

    if (currLine == null) {
      pkgJsonReader.close();
    }

    BufferedWriter pkgJsonWriter = new BufferedWriter(new FileWriter(pkgJson));
    pkgJsonWriter.write(toWrite.toString());
    pkgJsonWriter.close();
  }

  /**
   * Upon targetting the version line, this 
   * method is called to modify its string
   */
  private String updateVersion(String line) {
    Pattern versionPattern = Pattern.compile("(?<=\\\"version\\\"\\:\\s\\\")[\\d\\.]+(?=\\\"\\,)");
    Matcher versionPatternMatcher = versionPattern.matcher(line);
    String[] parsed = null;
    StringBuilder updated = new StringBuilder();
    int targetNum;

    if (versionPatternMatcher.find()) {
      parsed = versionPatternMatcher.group().split("\\.");
    }

    if (parsed == null) {
      throw new Error("Line does not match");
    }

    switch (this.type) {
      case Evolution.Micro:
        targetNum = Integer.parseInt(parsed[2]) + 1;
        updated.append(parsed[0]).append('.').append(parsed[1]).append('.').append(targetNum);
        break;
      case Evolution.Proxy: 
        targetNum = Integer.parseInt(parsed[1]) + 1;
        updated.append(parsed[0]).append('.').append(targetNum).append('.').append(0);
        break;
      case Evolution.Macro: 
        targetNum = Integer.parseInt(parsed[0]) + 1;
        updated.append(targetNum).append('.').append(0).append('.').append(0);
        break;
    }

    return updated.toString();
  }

  /**
   * Sets the version if given by the user
   *
   * @param ver the full version for replacing
   */
  public void setVer(String ver) {
    Pattern versionPattern = Pattern.compile("[\\d]+\\.[\\d]+\\.[\\d]+");
    Matcher versionPatternMatcher = versionPattern.matcher(ver);
    if (versionPatternMatcher.find()) {
      this.ver = versionPatternMatcher.group();
    } 
  }

  public static void main(String[] args) {
    Versioner vrsr;
    if (args.length == 0) {
      vrsr = new Versioner(Evolution.Micro);
    } else {
      vrsr = new Versioner(args[0]);
    }

    try {
      vrsr.execute();
    } catch (IOException exc1) {
      System.out.printf("%s", exc1);
    }
  }
}
